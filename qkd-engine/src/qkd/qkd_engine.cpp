#include "qkd/qkd_engine.hpp"
#include "bb84/protocol.hpp"

namespace qrypt::qkd {

QKDResult QKDEngine::run(const BB84Config& config) {
    return run_bb84(config);
}

} // namespace qrypt::qkd
