#pragma once
#include <string>
#include <chrono>
#include <cstddef>

namespace qrypt::qkd {

struct BB84Config {
    size_t raw_key_bits;
    double qber_threshold;
    bool eve_enabled;
    size_t final_key_bits = 256;
};

struct QKDSession {
    std::string session_id;
    BB84Config config;
    std::chrono::system_clock::time_point timestamp;
    size_t transmitted_bits = 0;
    size_t sifted_bits = 0;
    double qber = 0.0;
    bool eve_enabled = false;
    bool accepted = false;
    size_t final_key_length_bits = 0;
};

} // namespace qrypt::qkd
