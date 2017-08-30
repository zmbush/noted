#![deny(unused)]

#[cfg(test)]
#[macro_use]
extern crate pretty_assertions;
extern crate pulldown_cmark;

use pulldown_cmark::{Parser, html};
use std::borrow::Borrow;
use std::collections::{HashMap, HashSet};

#[derive(Debug)]
enum DocToken<'a> {
    Word(&'a str),
    Delimiter(&'a str),
}

impl<'a> Borrow<str> for DocToken<'a> {
    fn borrow(&self) -> &str {
        match *self {
            DocToken::Word(ref w) => w,
            DocToken::Delimiter(ref d) => d,
        }
    }
}

struct DocTokenizer<'a> {
    document: &'a str,
    delimiters: HashSet<&'a str>,
    dex: usize,
}

impl<'a> DocTokenizer<'a> {
    fn new(document: &str) -> DocTokenizer {
        DocTokenizer::new_with_delimiters(document, vec![".", " ", ",", ";"].into_iter().collect())
    }

    fn new_with_delimiters(document: &'a str, delimiters: HashSet<&'a str>) -> DocTokenizer<'a> {
        DocTokenizer {
            document,
            delimiters,
            dex: 0,
        }
    }
}

impl<'a> Iterator for DocTokenizer<'a> {
    type Item = DocToken<'a>;

    fn next(&mut self) -> Option<DocToken<'a>> {
        let startix = self.dex;
        if self.dex == self.document.len() {
            return None;
        }
        while self.dex < self.document.len() &&
            !self.delimiters
                 .contains(&self.document[self.dex..self.dex + 1])
        {
            self.dex += 1;
        }
        if startix == self.dex {
            self.dex += 1;
            Some(DocToken::Delimiter(&self.document[self.dex - 1..self.dex]))
        } else {
            Some(DocToken::Word(&self.document[startix..self.dex]))
        }
    }
}

#[derive(Debug)]
enum DocPart {
    Plain(String),
    Link(String, String),
}

#[derive(Debug)]
pub struct LinkedDocument {
    parts: Vec<DocPart>,
}

impl LinkedDocument {
    pub fn new<T: Borrow<str>>(text: T, page_names: HashMap<&str, &str>) -> LinkedDocument {
        let mut doc = LinkedDocument { parts: Vec::new() };
        let mut section = String::with_capacity(1000);
        let mut link: Vec<DocToken> = Vec::new();
        for token in DocTokenizer::new(text.borrow()) {
            if link.len() > 10 {
                section.push_str(link.remove(0).borrow());
            }
            match token {
                DocToken::Delimiter(" ") => {}
                DocToken::Delimiter(d) => {
                    section.push_str(&link.join(""));
                    section.push_str(d);
                    link = Vec::new();
                    continue;
                }
                DocToken::Word(_) => {}
            }
            link.push(token);
            for i in 1..link.len() {
                let phrase = &link[link.len() - i..link.len()].join("");
                if let Some(url) = page_names.get(phrase.to_lowercase().as_str()) {
                    section.push_str(&link[0..link.len() - i].join(""));
                    doc.parts.push(DocPart::Plain(section));
                    section = String::with_capacity(1000);
                    doc.parts
                       .push(DocPart::Link(phrase.to_string(), url.to_string()));
                    link = Vec::new();
                    break;
                }
            }
        }

        doc.parts.push(DocPart::Plain(section));
        if link.len() > 0 {
            doc.parts.push(DocPart::Plain(link.join("")));
        }

        doc
    }

    pub fn get_md(&self) -> String {
        let mut output = String::new();
        for part in &self.parts {
            match part {
                &DocPart::Plain(ref s) => output.push_str(s),
                &DocPart::Link(ref name, ref url) => {
                    output.push_str(&format!("[{}]({})", name, url));
                }
            }
        }
        output
    }

    pub fn get_html(&self) -> String {
        let md = self.get_md();
        let parser = Parser::new(&md);
        let mut html_buf = String::new();
        html::push_html(&mut html_buf, parser);

        html_buf
    }
}

#[cfg(test)]
mod tests {
    use LinkedDocument;

    #[test]
    fn it_works() {
        let doctext = "I would like to test the system. This is that test.";
        let pages = vec![("test", "/test.html"), ("the system", "/system.html")]
            .into_iter()
            .collect();
        let doc = LinkedDocument::new(doctext, pages);
        assert_eq!(doc.get_html(), r#"<p>I would like to <a href="/test.html">test</a> <a href="/system.html">the system</a>. This is that <a href="/test.html">test</a>.</p>
"#);
        assert_eq!(doc.get_md(), r#"I would like to [test](/test.html) [the system](/system.html). This is that [test](/test.html)."#);
    }
}
