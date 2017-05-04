use ncurses::*;

pub enum State {
    Idle,
    Search,
}

pub enum Event {
    Key(char),
    StartSearch,
    Escape,
    Quit
}

pub struct UI {
    state: State,
}

impl UI {
    pub fn new() -> UI {
        initscr();
        raw();
        keypad(stdscr(), true);
        noecho();
        UI { state: State::Idle }
    }

    fn render(&self) {
    }

    pub fn wait(&self) -> Event {
        self.render();
        match getch() {
            KEY_EXIT =>  Event::Escape,
            KEY_F1 => Event::Quit,
            ch => {
                if ch == '/' as i32 {
                    Event::StartSearch
                } else {
                    Event::Key(ch as u8 as char)
                }
            }
        }
    }
}

impl Drop for UI {
    fn drop(&mut self) {
        endwin();
    }
}
