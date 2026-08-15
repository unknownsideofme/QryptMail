#pragma once
#include "bb84/bit.hpp"
#include "bb84/basis.hpp"
#include "bb84/quantum_state.hpp"
#include <vector>
#include <cstddef>

namespace qrypt::qkd {

class Bob {
public:
    Bob() = default;
    ~Bob() = default;

    void generate_bases(size_t num_bits);
    void measure(const std::vector<QuantumState>& states);

    const std::vector<Bit>& measured_bits() const { return measured_bits_; }
    const std::vector<Basis>& bases() const { return bases_; }

private:
    std::vector<Basis> bases_;
    std::vector<Bit> measured_bits_;
};

} // namespace qrypt::qkd
