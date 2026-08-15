#pragma once
#include "bb84/bit.hpp"
#include "bb84/basis.hpp"

namespace qrypt::qkd {

struct QuantumState {
    double alpha;
    double beta;
};

QuantumState encode(Bit bit, Basis basis);

struct MeasurementResult {
    Bit bit;
    double probability_of_zero;
};

MeasurementResult measure(
    const QuantumState& state,
    Basis measurement_basis
);

} // namespace qrypt::qkd
