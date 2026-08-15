#pragma once
#include "qkd/qkd_session.hpp"
#include "qkd/qkd_result.hpp"

namespace qrypt::qkd {

QKDResult run_bb84(const BB84Config& config);

} // namespace qrypt::qkd
