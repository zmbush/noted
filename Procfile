test: cargo watch -w src -w db -s 'cargo test --all --color=always && cargo clippy --all-targets --all-features --color=always -- -D warnings && touch .trigger'
server: cargo watch --no-gitignore -w .trigger -s 'cargo run --bin noted --color=always'
webpack: yarn webpack --color --config webpack.dev.js -w
jest: yarn jest --watchAll --coverage --color=true --maxWorkers=1
tsm: yarn tsm -w
