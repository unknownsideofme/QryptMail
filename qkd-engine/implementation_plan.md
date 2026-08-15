# Implementation Plan - C++20 Software QKD Engine

This document outlines the design and implementation plan for building a standalone, production-quality Software QKD Engine in C++20 for the QryptMail project.

The engine will simulate the logical BB84 protocol workflow including state preparation, quantum channel transmission, intercept-resend eavesdropping, basis sifting, QBER estimation, prototype block-parity reconciliation, and HKDF-based privacy amplification.

---

## User Review Required

> [!IMPORTANT]
> - **No CMake on Path:** CMake was not found in the standard paths on this system. Homebrew is installed at `/opt/homebrew/bin/brew`. We will install `cmake` using `/opt/homebrew/bin/brew install cmake` during the execution phase.
> - **OpenSSL Path:** OpenSSL 3.x is installed at `/opt/homebrew/opt/openssl@3`. We will configure the CMake project to look for OpenSSL in this directory.

---

## Open Questions

> [!NOTE]
> 1. **QBER Estimation vs. Key Preservation:** In physical QKD, Alice and Bob estimate QBER by revealing a random sample (e.g. 10%) of their sifted keys, which is then discarded. The remaining sifted key is reconciled. If we reconcile the *entire* sifted key (without discarding the compared bits), the key is compromised in a real setting.
>    - **Proposed Solution:** By default, we will partition the sifted key: we will select a random sample of sifted bits to estimate the QBER, discard them, and use the remaining sifted bits for error reconciliation and privacy amplification. This is highly realistic and mathematically secure. We will make the sample fraction configurable.

---

## Proposed Changes

We will create a new C++ CMake project in the `/Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/` directory.

### Common Utilities

#### [NEW] [random.hpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/include/common/random.hpp)
Declares the `SecureRandom` class. It will wrap `std::random_device` (OS secure entropy source) and use a buffered approach for high-performance generation of random bits, bases, bytes, and probabilities.

#### [NEW] [random.cpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/src/common/random.cpp)
Implements `SecureRandom` with optimized byte buffering to avoid slow system calls when generating large amounts of bits (e.g., 1,000,000 bits).

#### [NEW] [bytes.hpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/include/common/bytes.hpp)
Declares helper functions for packing/unpacking vector of `Bit` into `std::vector<uint8_t>`, and hex formatting.

#### [NEW] [errors.hpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/include/common/errors.hpp)
Defines custom exception types for QKD protocol failures (e.g., threshold exceeded, insufficient sifted bits).

---

### BB84 Core Simulation

#### [NEW] [bit.hpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/include/bb84/bit.hpp)
Strong type for quantum bits (`enum class Bit : uint8_t { Zero = 0, One = 1 }`).

#### [NEW] [basis.hpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/include/bb84/basis.hpp)
Strong type for BB84 measurement bases (`enum class Basis { Rectilinear, Diagonal }`).

#### [NEW] [quantum_state.hpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/include/bb84/quantum_state.hpp)
Defines `QuantumState` representing $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$, `encode(Bit, Basis)`, and `measure(QuantumState, Basis)`.

#### [NEW] [quantum_state.cpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/src/bb84/quantum_state.cpp)
Implements quantum state preparation and basis-dependent measurement probabilities (100% on match, 50% on mismatch) using the OS secure random source.

#### [NEW] [alice.hpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/include/bb84/alice.hpp)
Defines `Alice` component which generates random bits, random bases, and prepares the quantum states.

#### [NEW] [alice.cpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/src/bb84/alice.cpp)
Implements `Alice` state generation.

#### [NEW] [bob.hpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/include/bb84/bob.hpp)
Defines `Bob` component which measures incoming states in randomly selected bases.

#### [NEW] [bob.cpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/src/bb84/bob.cpp)
Implements `Bob` measurement.

#### [NEW] [eve.hpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/include/bb84/eve.hpp)
Defines `Eve` intercept-resend component.

#### [NEW] [eve.cpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/src/bb84/eve.cpp)
Implements `Eve` choosing a random basis, measuring the intercepted state, and prepending a new state.

#### [NEW] [channel.hpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/include/bb84/channel.hpp)
Defines `QuantumChannel` with support for an optional `Eve` eavesdropping model and a noise probability.

#### [NEW] [channel.cpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/src/bb84/channel.cpp)
Implements channel transmission logic.

---

### BB84 Post-Processing

#### [NEW] [sifting.hpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/include/bb84/sifting.hpp)
Declares the sifting function.

#### [NEW] [sifting.cpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/src/bb84/sifting.cpp)
Implements basis matching and sifting index extraction.

#### [NEW] [qber.hpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/include/bb84/qber.hpp)
Declares QBER calculation.

#### [NEW] [qber.cpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/src/bb84/qber.cpp)
Implements calculating the mismatch ratio between two keys.

#### [NEW] [reconciliation.hpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/include/bb84/reconciliation.hpp)
Declares a modular `ErrorReconciler` interface and a `PrototypeReconciler` class implementing block-parity binary search reconciliation.

#### [NEW] [reconciliation.cpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/src/bb84/reconciliation.cpp)
Implements a multi-pass Cascade-like block-parity reconciliation protocol. It divides keys into blocks, checks parity, performs binary searches to locate and flip mismatched bits, and runs multiple passes on pseudorandomly shuffled copies of the keys to correct remaining errors.

#### [NEW] [privacy_amplification.hpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/include/bb84/privacy_amplification.hpp)
Declares the `PrivacyAmplifier` class.

#### [NEW] [privacy_amplification.cpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/src/bb84/privacy_amplification.cpp)
Implements privacy amplification using OpenSSL HKDF-SHA256. It extracts entropy from the reconciled bits (packed into bytes) and expands them into the requested final key length.

#### [NEW] [protocol.hpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/include/bb84/protocol.hpp)
Helper definitions for the protocol orchestration.

#### [NEW] [protocol.cpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/src/bb84/protocol.cpp)
Logical execution steps.

---

### High-Level API

#### [NEW] [qkd_result.hpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/include/qkd/qkd_result.hpp)
Defines `QKDResult` struct.

#### [NEW] [qkd_session.hpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/include/qkd/qkd_session.hpp)
Defines `BB84Config` and `QKDSession` structs.

#### [NEW] [qkd_engine.hpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/include/qkd/qkd_engine.hpp)
Defines the `QKDEngine` class.

#### [NEW] [qkd_engine.cpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/src/qkd/qkd_engine.cpp)
Implements the main orchestrator (`run`), partitioning the sifted key into QBER estimation and reconciliation subsets, running sifting, verification, error reconciliation, privacy amplification, and returning the result.

---

### Tests, Demos and Build System

#### [NEW] [CMakeLists.txt](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/CMakeLists.txt)
Configures CMake for C++20, adds GoogleTest (fetched via FetchContent), OpenSSL integration, and builds targets: `qkd_engine` (library), `bb84_demo` (CLI demo), and `qkd_tests` (unit tests).

#### [NEW] [bb84_demo.cpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/examples/bb84_demo.cpp)
CLI demo supporting `--bits`, `--eve`, and multiple run combinations demonstrating Eve ON/OFF scenarios and final key validation.

#### [NEW] [test_quantum_states.cpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/tests/test_quantum_states.cpp)
Tests encoding of bits into quantum states.

#### [NEW] [test_measurement.cpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/tests/test_measurement.cpp)
Tests that measurements produce 100% agreement on matched bases and 50/50 probability on mismatched bases.

#### [NEW] [test_sifting.cpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/tests/test_sifting.cpp)
Tests basis sifting indices and key extraction.

#### [NEW] [test_qber.cpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/tests/test_qber.cpp)
Tests QBER calculation including edge cases.

#### [NEW] [test_eve.cpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/tests/test_eve.cpp)
Tests that Eve intercept-resend attack introduces the theoretical 25% QBER when Alice/Bob have matching bases.

#### [NEW] [test_reconciliation.cpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/tests/test_reconciliation.cpp)
Tests block-parity error correction of noisy keys.

#### [NEW] [test_privacy_amplification.cpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/tests/test_privacy_amplification.cpp)
Tests HKDF-based privacy amplification.

#### [NEW] [test_bb84.cpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/tests/test_bb84.cpp)
Statistical and integration tests of the full BB84 protocol.

#### [NEW] [test_qkd_engine.cpp](file:///Users/debanjan/Desktop/CodeBook/QryptMail/qkd-engine/tests/test_qkd_engine.cpp)
Regression, performance, and key sizes testing.

---

## Verification Plan

### Automated Tests
We will build and run all test targets:
```bash
# 1. Install CMake
/opt/homebrew/bin/brew install cmake

# 2. Build the project
/opt/homebrew/bin/cmake -S qkd-engine -B qkd-engine/build -DOPENSSL_ROOT_DIR=/opt/homebrew/opt/openssl@3
/opt/homebrew/bin/cmake --build qkd-engine/build

# 3. Run all tests
ctest --test-dir qkd-engine/build --output-on-failure
```

### Manual Verification
We will run the CLI demo in three modes:
1. **Eve OFF:**
   ```bash
   ./qkd-engine/build/bb84_demo --bits 100000
   ```
   Expect: QBER near 0%, Status: ACCEPTED, identical final keys.
2. **Eve ON:**
   ```bash
   ./qkd-engine/build/bb84_demo --bits 100000 --eve
   ```
   Expect: QBER near 25%, Status: REJECTED.
3. **Eve OFF with noise (internal channel noise model check):**
   Verify statistical distributions.
