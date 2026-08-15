#include "bb84/privacy_amplification.hpp"
#include "common/bytes.hpp"
#include "common/errors.hpp"
#include <openssl/kdf.h>
#include <openssl/evp.h>
#include <openssl/params.h>
#include <stdexcept>

namespace qrypt::qkd {

std::vector<uint8_t> PrivacyAmplifier::amplify(
    const std::vector<Bit>& reconciled_key,
    size_t requested_key_bits,
    const std::string& session_id
) {
    if (reconciled_key.empty()) {
        throw std::invalid_argument("Cannot amplify an empty reconciled key");
    }

    if (requested_key_bits % 8 != 0) {
        throw std::invalid_argument("Requested key size must be a multiple of 8 bits");
    }

    size_t out_len = requested_key_bits / 8;

    std::vector<uint8_t> ikm = pack_bits(reconciled_key);

    std::string info_str = "QryptMail BB84 Privacy Amplification Context";
    std::vector<uint8_t> info(info_str.begin(), info_str.end());

    std::vector<uint8_t> salt(session_id.begin(), session_id.end());

    EVP_KDF* kdf = EVP_KDF_fetch(nullptr, "HKDF", nullptr);
    if (!kdf) {
        throw QKDEngineError("Failed to fetch HKDF from OpenSSL");
    }

    EVP_KDF_CTX* kctx = EVP_KDF_CTX_new(kdf);
    EVP_KDF_free(kdf);
    if (!kctx) {
        throw QKDEngineError("Failed to create HKDF context");
    }

    OSSL_PARAM params[5];
    params[0] = OSSL_PARAM_construct_utf8_string("digest", const_cast<char*>("SHA256"), 0);
    params[1] = OSSL_PARAM_construct_octet_string("key", static_cast<void*>(ikm.data()), ikm.size());
    params[2] = OSSL_PARAM_construct_octet_string("salt", static_cast<void*>(salt.data()), salt.size());
    params[3] = OSSL_PARAM_construct_octet_string("info", static_cast<void*>(info.data()), info.size());
    params[4] = OSSL_PARAM_construct_end();

    std::vector<uint8_t> okm(out_len);
    int rc = EVP_KDF_derive(kctx, okm.data(), okm.size(), params);
    EVP_KDF_CTX_free(kctx);

    if (rc <= 0) {
        throw QKDEngineError("OpenSSL HKDF derivation failed");
    }

    return okm;
}

} // namespace qrypt::qkd
