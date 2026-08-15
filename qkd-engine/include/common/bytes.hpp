#pragma once
#include "bb84/bit.hpp"
#include <vector>
#include <string>
#include <cstdint>
#include <cstddef>
#include <sstream>
#include <iomanip>

namespace qrypt::qkd {

inline std::vector<uint8_t> pack_bits(const std::vector<Bit>& bits) {
    std::vector<uint8_t> bytes((bits.size() + 7) / 8, 0);
    for (size_t i = 0; i < bits.size(); ++i) {
        if (bits[i] == Bit::One) {
            bytes[i / 8] |= (1 << (7 - (i % 8)));
        }
    }
    return bytes;
}

inline std::vector<Bit> unpack_bits(const std::vector<uint8_t>& bytes, size_t original_bit_count) {
    std::vector<Bit> bits(original_bit_count);
    for (size_t i = 0; i < original_bit_count; ++i) {
        uint8_t byte_val = bytes[i / 8];
        bool bit_val = (byte_val & (1 << (7 - (i % 8)))) != 0;
        bits[i] = bit_val ? Bit::One : Bit::Zero;
    }
    return bits;
}

inline std::string to_hex(const std::vector<uint8_t>& bytes) {
    std::ostringstream oss;
    oss << std::hex << std::setfill('0');
    for (uint8_t b : bytes) {
        oss << std::setw(2) << static_cast<int>(b);
    }
    return oss.str();
}

} // namespace qrypt::qkd
