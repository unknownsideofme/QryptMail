#pragma once
#include "bb84/basis.hpp"
#include "bb84/quantum_state.hpp"

namespace qrypt::qkd {

class Eve {
public:
    Eve() = default;
    ~Eve() = default;

    QuantumState intercept_resend(const QuantumState& incoming_state);
    Basis basis_used() const { return last_basis_used_; }

private:
    Basis last_basis_used_ = Basis::Rectilinear;
};

} // namespace qrypt::qkd
