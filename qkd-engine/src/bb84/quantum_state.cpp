#include "bb84/quantum_state.hpp"
#include "common/random.hpp"
#include <cmath>
#include <algorithm>

namespace qrypt::qkd {

static SecureRandom& get_measurement_rng() {
    static thread_local SecureRandom rng;
    return rng;
}

QuantumState encode(Bit bit, Basis basis) {
    constexpr double inv_sqrt2 = 0.7071067811865475;
    if (basis == Basis::Rectilinear) {
        if (bit == Bit::Zero) {
            return QuantumState{1.0, 0.0};
        } else {
            return QuantumState{0.0, 1.0};
        }
    } else { // Basis::Diagonal
        if (bit == Bit::Zero) {
            return QuantumState{inv_sqrt2, inv_sqrt2};
        } else {
            return QuantumState{inv_sqrt2, -inv_sqrt2};
        }
    }
}

MeasurementResult measure(const QuantumState& state, Basis measurement_basis) {
    double prob_zero = 0.0;
    if (measurement_basis == Basis::Rectilinear) {
        prob_zero = state.alpha * state.alpha;
    } else { // Basis::Diagonal
        double val = state.alpha + state.beta;
        prob_zero = (val * val) / 2.0;
    }

    // Clamp prob_zero to [0, 1] due to double-precision arithmetic limits
    prob_zero = std::clamp(prob_zero, 0.0, 1.0);

    double r = get_measurement_rng().uniform_probability();
    Bit measured_bit = (r < prob_zero) ? Bit::Zero : Bit::One;

    return MeasurementResult{measured_bit, prob_zero};
}

} // namespace qrypt::qkd
