#include "bb84/reconciliation.hpp"
#include <numeric>
#include <algorithm>
#include <random>
#include <stdexcept>

namespace qrypt::qkd {

static std::vector<size_t> generate_permutation(size_t size, uint32_t seed) {
    std::vector<size_t> perm(size);
    std::iota(perm.begin(), perm.end(), 0);
    if (seed != 0) {
        std::mt19937 g(seed);
        std::shuffle(perm.begin(), perm.end(), g);
    }
    return perm;
}

static std::vector<Bit> apply_permutation(const std::vector<Bit>& key, const std::vector<size_t>& perm) {
    std::vector<Bit> shuffled(key.size());
    for (size_t i = 0; i < key.size(); ++i) {
        shuffled[i] = key[perm[i]];
    }
    return shuffled;
}

static std::vector<Bit> invert_permutation(const std::vector<Bit>& shuffled, const std::vector<size_t>& perm) {
    std::vector<Bit> original(shuffled.size());
    for (size_t i = 0; i < shuffled.size(); ++i) {
        original[perm[i]] = shuffled[i];
    }
    return original;
}

static bool compute_parity(const std::vector<Bit>& key, size_t start, size_t end) {
    size_t count = 0;
    for (size_t i = start; i <= end; ++i) {
        if (key[i] == Bit::One) {
            ++count;
        }
    }
    return (count % 2) != 0;
}

static void correct_single_error(
    const std::vector<Bit>& alice_key,
    std::vector<Bit>& bob_key,
    size_t start,
    size_t end,
    size_t& bits_revealed
) {
    size_t L = start;
    size_t R = end;

    while (L < R) {
        size_t mid = L + (R - L) / 2;
        
        bool alice_parity = compute_parity(alice_key, L, mid);
        bits_revealed += 1;

        bool bob_parity = compute_parity(bob_key, L, mid);

        if (alice_parity != bob_parity) {
            R = mid;
        } else {
            L = mid + 1;
        }
    }

    bob_key[L] = (bob_key[L] == Bit::Zero) ? Bit::One : Bit::Zero;
}

std::vector<Bit> PrototypeReconciler::reconcile(
    const std::vector<Bit>& alice_key,
    const std::vector<Bit>& bob_key,
    size_t& bits_revealed
) {
    if (alice_key.size() != bob_key.size()) {
        throw std::invalid_argument("Keys must be of the same length to reconcile");
    }

    bits_revealed = 0;
    if (alice_key.empty()) {
        return {};
    }

    std::vector<Bit> reconciled_bob = bob_key;
    size_t n = alice_key.size();

    struct Pass {
        size_t block_size;
        uint32_t seed;
    };
    std::vector<Pass> passes = {
        {8, 0},
        {16, 42},
        {32, 1337},
        {64, 9999}
    };

    for (const auto& pass : passes) {
        size_t block_size = std::min(pass.block_size, n);
        if (block_size == 0) continue;

        std::vector<size_t> perm = generate_permutation(n, pass.seed);
        std::vector<Bit> shuffled_alice = apply_permutation(alice_key, perm);
        std::vector<Bit> shuffled_bob = apply_permutation(reconciled_bob, perm);

        for (size_t i = 0; i < n; i += block_size) {
            size_t start = i;
            size_t end = std::min(i + block_size - 1, n - 1);

            bool alice_parity = compute_parity(shuffled_alice, start, end);
            bits_revealed += 1;

            bool bob_parity = compute_parity(shuffled_bob, start, end);

            if (alice_parity != bob_parity) {
                correct_single_error(shuffled_alice, shuffled_bob, start, end, bits_revealed);
            }
        }

        reconciled_bob = invert_permutation(shuffled_bob, perm);
    }

    return reconciled_bob;
}

} // namespace qrypt::qkd
