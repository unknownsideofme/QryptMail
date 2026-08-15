#pragma once
#include <stdexcept>
#include <string>

namespace qrypt::qkd {

class QKDEngineError : public std::runtime_error {
public:
    using std::runtime_error::runtime_error;
};

class QBERThresholdExceededError : public QKDEngineError {
public:
    QBERThresholdExceededError(double qber, double threshold)
        : QKDEngineError("QBER of " + std::to_string(qber * 100.0) + 
                          "% exceeded configured threshold of " + 
                          std::to_string(threshold * 100.0) + "%")
        , qber_(qber)
        , threshold_(threshold)
    {}

    double qber() const { return qber_; }
    double threshold() const { return threshold_; }

private:
    double qber_;
    double threshold_;
};

class InsufficientSiftedBitsError : public QKDEngineError {
public:
    InsufficientSiftedBitsError(size_t sifted, size_t required)
        : QKDEngineError("Insufficient sifted bits: got " + std::to_string(sifted) + 
                          ", but need at least " + std::to_string(required))
        , sifted_(sifted)
        , required_(required)
    {}

    size_t sifted() const { return sifted_; }
    size_t required() const { return required_; }

private:
    size_t sifted_;
    size_t required_;
};

} // namespace qrypt::qkd
