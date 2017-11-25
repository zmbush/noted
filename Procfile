prebuild: cargo watch -x 'build --color=always && cargo +nightly clippy -- -D clippy' -s 'touch .trigger'
server: cargo watch --no-gitignore -w .trigger -x 'run --color=always'
