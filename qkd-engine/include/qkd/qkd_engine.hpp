#pragma once
#include "qkd/qkd_session.hpp"
#include "qkd/qkd_result.hpp"

namespace qrypt::qkd {

class QKDEngine {
public:
    QKDEngine() = default;
    ~QKDEngine() = default;

    QKDResult run(const BB84Config& config);
};

} // namespace qrypt::qkd
