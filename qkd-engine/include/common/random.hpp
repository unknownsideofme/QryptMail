#pragma once
#include "bb84/bit.hpp"
#include "bb84/basis.hpp"
#include <vector>
#include <cstdint>
#include <cstddef>
#include <random>

namespace qrypt::qkd {

class SecureRandom {
public:
    SecureRandom();
    ~SecureRandom() = default;

    // Delete copy/move constructors for safety
    SecureRandom(const SecureRandom&) = delete;
    SecureRandom& operator=(const SecureRandom&) = delete;
    SecureRandom(SecureRandom&&) = delete;
    SecureRandom& operator=(SecureRandom&&) = delete;

    Bit random_bit();
    Basis random_basis();
    std::vector<uint8_t> random_bytes(size_t n);
    double uniform_probability();

private:
    std::random_device rd_;
    std::vector<uint8_t> buffer_;
    size_t index_;
    uint8_t bit_buffer_;
    int bits_left_;

    void refill_buffer();
    uint8_t next_byte();
};

} // namespace qrypt::qkd
