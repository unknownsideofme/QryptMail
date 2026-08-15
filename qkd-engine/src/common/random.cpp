#include "common/random.hpp"
#include <algorithm>
#include <cstring>

namespace qrypt::qkd {

SecureRandom::SecureRandom()
    : index_(0)
    , bit_buffer_(0)
    , bits_left_(0)
{
    refill_buffer();
}

void SecureRandom::refill_buffer() {
    const size_t refill_size = 4096;
    buffer_.resize(refill_size);
    
    // Fill the buffer with random data from std::random_device.
    size_t offset = 0;
    while (offset < refill_size) {
        std::random_device::result_type val = rd_();
        size_t to_copy = std::min(sizeof(val), refill_size - offset);
        std::memcpy(buffer_.data() + offset, &val, to_copy);
        offset += to_copy;
    }
    index_ = 0;
}

uint8_t SecureRandom::next_byte() {
    if (index_ >= buffer_.size()) {
        refill_buffer();
    }
    return buffer_[index_++];
}

Bit SecureRandom::random_bit() {
    if (bits_left_ <= 0) {
        bit_buffer_ = next_byte();
        bits_left_ = 8;
    }
    bool bit_val = (bit_buffer_ & 1) != 0;
    bit_buffer_ >>= 1;
    --bits_left_;
    return bit_val ? Bit::One : Bit::Zero;
}

Basis SecureRandom::random_basis() {
    return (random_bit() == Bit::One) ? Basis::Diagonal : Basis::Rectilinear;
}

std::vector<uint8_t> SecureRandom::random_bytes(size_t n) {
    std::vector<uint8_t> bytes(n);
    for (size_t i = 0; i < n; ++i) {
        bytes[i] = next_byte();
    }
    return bytes;
}

double SecureRandom::uniform_probability() {
    uint64_t val = 0;
    for (int i = 0; i < 8; ++i) {
        val = (val << 8) | next_byte();
    }
    return double(val & 0x1FFFFFFFFFFFFFULL) / double(1ULL << 53);
}

} // namespace qrypt::qkd
