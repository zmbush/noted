KCOV_VERSION=36

sudo apt install -y cmake g++ pkg-config jq
sudo apt install -y libcurl4-openssl-dev libelf-dev libdw-dev binutils-dev libiberty-dev

wget https://github.com/SimonKagstrom/kcov/archive/v$KCOV_VERSION.tar.gz && \
    tar xzf v$KCOV_VERSION.tar.gz && \
    rm v$KCOV_VERSION.tar.gz && \
    cd kcov-$KCOV_VERSION && \
    mkdir build && cd build && \
    cmake .. && make

(cargo install --list | grep cargo-kcov) || cargo install cargo-kcov || true
