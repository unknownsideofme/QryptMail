#pragma once
#include "bb84/bit.hpp"
#include <vector>
#include <string>
#include <cstdint>
#include <cstddef>

namespace qrypt::qkd {

class PrivacyAmplifier {
public:
    PrivacyAmplifier() = default;
    ~PrivacyAmplifier() = default;

    std::vector<uint8_t> amplify(
        const std::vector<Bit>& reconciled_key,
        size_t requested_key_bits,
        const std::string& session_id
    );
};

} // namespace qrypt::qkd
