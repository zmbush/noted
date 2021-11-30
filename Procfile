test: cargo watch -w src -w db -s 'cargo test --all --color=always && cargo clippy --all-targets --all-features --color=always -- -D warnings && touch .trigger'
server: cargo watch --no-gitignore -w .trigger -s 'cargo run --color=always'
webpack: npx webpack --color --config webpack.dev.js -w
jest: npx jest --watchAll --coverage --color=true --maxWorkers=1
tsm: npx tsm js -w
