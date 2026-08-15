#pragma once
#include "bb84/bit.hpp"
#include <vector>
#include <memory>

namespace qrypt::qkd {

class ErrorReconciler {
public:
    virtual ~ErrorReconciler() = default;

    virtual std::vector<Bit> reconcile(
        const std::vector<Bit>& alice_key,
        const std::vector<Bit>& bob_key,
        size_t& bits_revealed
    ) = 0;
};

class PrototypeReconciler : public ErrorReconciler {
public:
    PrototypeReconciler() = default;
    ~PrototypeReconciler() override = default;

    std::vector<Bit> reconcile(
        const std::vector<Bit>& alice_key,
        const std::vector<Bit>& bob_key,
        size_t& bits_revealed
    ) override;
};

} // namespace qrypt::qkd
