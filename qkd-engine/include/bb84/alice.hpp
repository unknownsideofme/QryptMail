#pragma once
#include "bb84/bit.hpp"
#include "bb84/basis.hpp"
#include "bb84/quantum_state.hpp"
#include <vector>
#include <cstddef>

namespace qrypt::qkd {

class Alice {
public:
    Alice() = default;
    ~Alice() = default;

    void generate(size_t num_bits);

    const std::vector<Bit>& bits() const { return bits_; }
    const std::vector<Basis>& bases() const { return bases_; }
    const std::vector<QuantumState>& states() const { return states_; }

private:
    std::vector<Bit> bits_;
    std::vector<Basis> bases_;
    std::vector<QuantumState> states_;
};

} // namespace qrypt::qkd
