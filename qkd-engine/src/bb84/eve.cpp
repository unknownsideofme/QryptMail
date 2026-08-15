#include "bb84/eve.hpp"
#include "common/random.hpp"

namespace qrypt::qkd {

QuantumState Eve::intercept_resend(const QuantumState& incoming_state) {
    SecureRandom rng;
    last_basis_used_ = rng.random_basis();
    
    // Eve measures the state in her chosen basis
    MeasurementResult res = qrypt::qkd::measure(incoming_state, last_basis_used_);
    
    // Eve encodes the measured bit in her chosen basis and forwards it
    return encode(res.bit, last_basis_used_);
}

} // namespace qrypt::qkd
