# QryptMail Software QKD Engine (C++20)

This repository contains a high-performance, mathematically meaningful software simulation of the **BB84 Quantum Key Distribution (QKD) protocol** written in modern C++20 and integrated with OpenSSL for cryptographic post-processing.

> [!IMPORTANT]
> **This project is a software simulation of the BB84 protocol. It does not provide physical quantum security and does not replace a real QKD implementation.** It models the logical, information-theoretic workflow of QKD and is designed to later interface with a Key Manager and email application in the QryptMail project.

---

## Table of Contents
1. [Introduction to QKD and BB84](#introduction-to-qkd-and-bb84)
2. [What This Simulator Models](#what-this-simulator-models)
3. [What This Simulator Does NOT Model](#what-this-simulator-does-not-model)
4. [Architecture](#architecture)
5. [BB84 Algorithm Steps](#bb84-algorithm-steps)
6. [Eavesdropping (Eve's Intercept-Resend Attack)](#eavesdropping-eves-intercept-resend-attack)
7. [Post-Processing (Sifting, Reconciliation, Privacy Amplification)](#post-processing-sifting-reconciliation-privacy-amplification)
8. [Build and Test Instructions](#build-and-test-instructions)
9. [Demo Instructions](#demo-instructions)
10. [Future Integration with QKD Key Manager](#future-integration-with-qkd-key-manager)

---

## Introduction to QKD and BB84
**Quantum Key Distribution (QKD)** is a secure communication method that implements a cryptographic protocol involving components of quantum mechanics. It enables two parties (Alice and Bob) to produce a shared random secret key known only to them, which can then be used to encrypt and decrypt messages. 

The **BB84 protocol**, developed by Charles Bennett and Gilles Brassard in 1984, is the first and most widely implemented quantum cryptography protocol. It relies on the fundamental quantum principle that measuring an unknown quantum state disturbs the state. If an eavesdropper (Eve) attempts to intercept the key transmission, they inevitably introduce measurable errors (Quantum Bit Error Rate, or QBER), allowing Alice and Bob to detect the intrusion and reject the key.

---

## What This Simulator Models
- **Quantum Bases and State Encodings:** Mathematical representation of qubits $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$ in two conjugate bases: Rectilinear (computational, Z) and Diagonal (Hadamard, X).
- **Basis-Dependent Measurements:** Quantum measurement probabilities (100% correctness on matching bases, and 50/50 probability on mismatched bases) using a cryptographically secure system entropy source (`std::random_device`).
- **Actors (Alice, Bob, Eve):** Discrete actors executing their respective roles in preparing, measuring, and intercepting states.
- **Eve Intercept-Resend Attack:** Eve choosing measurement bases randomly, measuring Alice's states, and preparing new states in the measured bases to send to Bob.
- **Basis Reconciliation (Sifting):** Alice and Bob sharing bases publicly to extract matching indices.
- **Realistic QBER Estimation:** Alice and Bob selecting a random 10% sample of their sifted keys to compute the error rate, discarding the sample, and checking it against a configurable QBER threshold.
- **Prototype Error Reconciliation:** A Cascade-like interactive block-parity binary search algorithm. It partitions keys into blocks, checks block parity, performs binary searches to locate and correct errors, and runs multiple passes on shuffled keys using shared pseudorandom seeds.
- **Privacy Amplification:** Standard HKDF-SHA256 implemented via OpenSSL 3.x `EVP_KDF` to shrink the reconciled key and eliminate any information leaked to Eve, outputting a configurable-size final shared key (e.g. 128, 256, 512, 1024, 8192 bits).

---

## What This Simulator Does NOT Model
- **Physical Quantum Hardware:** There are no lasers, single-photon detectors, optical fibers, or polarization controllers. All state prepared and measured are mathematical simulations on classical CPUs.
- **Coherent/Decoy States:** The simulator assumes single-photon states and does not model multi-photon emission or decoy-state BB84.
- **Continuous Variable QKD:** Only discrete variable BB84 is implemented.
- **Physical Optical/Acoustic Noise:** The quantum channel is clean by default, although a configurable mathematical bit-flip noise rate is supported for test verification of reconciliation.

---

## Architecture

The project is structured to enforce strong separation of concerns, modularity, and testability.

```
qkd-engine/
├── CMakeLists.txt              # CMake build configuration (C++20, warnings-as-errors)
├── LICENSE                     # MIT License
├── README.md                   # Detailed documentation
│
├── include/
│   ├── bb84/
│   │   ├── basis.hpp           # Basis enum (Rectilinear, Diagonal)
│   │   ├── bit.hpp             # Bit enum (Zero, One)
│   │   ├── quantum_state.hpp   # QuantumState struct & measure()
│   │   ├── alice.hpp           # Alice actor
│   │   ├── bob.hpp             # Bob actor
│   │   ├── eve.hpp             # Eve actor (Intercept-Resend)
│   │   ├── channel.hpp         # QuantumChannel simulation
│   │   ├── sifting.hpp         # Sifting logic
│   │   ├── qber.hpp            # QBER calculation
│   │   ├── reconciliation.hpp  # Cascade block-parity reconciliation interface
│   │   ├── privacy_amplification.hpp # HKDF privacy amplification
│   │   └── protocol.hpp        # Core BB84 orchestrator
│   │
│   ├── common/
│   │   ├── random.hpp          # SecureRandom (buffered std::random_device)
│   │   ├── bytes.hpp           # Conversions and hex formatting
│   │   └── errors.hpp          # Custom exceptions
│   │
│   └── qkd/
│       ├── qkd_session.hpp     # Configuration/Session definitions
│       ├── qkd_result.hpp      # Results structure
│       └── qkd_engine.hpp      # High-level Engine API wrapper
│
├── src/                        # Implementations corresponding to headers
│   ├── bb84/ ...
│   ├── common/ ...
│   └── qkd/ ...
│
├── examples/
│   └── bb84_demo.cpp           # CLI Demonstration
│
└── tests/                      # Extensive GoogleTest unit and integration tests
    ├── test_quantum_states.cpp
    ├── test_measurement.cpp
    ├── test_sifting.cpp
    ├── test_qber.cpp
    ├── test_eve.cpp
    ├── test_reconciliation.cpp
    ├── test_privacy_amplification.cpp
    ├── test_bb84.cpp
    └── test_qkd_engine.cpp
```

---

## BB84 Algorithm Steps

1. **State Preparation (Alice):** Alice generates $N$ random bits and $N$ random bases. For each bit, she encodes it into a polarization state:
   - **Rectilinear Basis ($R$):**
     - $0 \rightarrow |0\rangle = \begin{pmatrix} 1 \\ 0 \end{pmatrix}$
     - $1 \rightarrow |1\rangle = \begin{pmatrix} 0 \\ 1 \end{pmatrix}$
   - **Diagonal Basis ($D$):**
     - $0 \rightarrow |+\rangle = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 \\ 1 \end{pmatrix}$
     - $1 \rightarrow |-\rangle = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 \\ -1 \end{pmatrix}$
2. **Transmission:** Alice transmits these states to Bob over the Quantum Channel.
3. **Eavesdropping (Optional):** If Eve is active, she intercepts each state, measures it in a randomly selected basis, and recreates/forwards a new state to Bob based on her measurement.
4. **Measurement (Bob):** Bob generates $N$ random bases and measures each incoming state.
5. **Sifting:** Alice and Bob publicly share their chosen bases (but not their bits). They keep only the bits where their bases matched. The matching fraction is statistically $\sim 50\%$.
6. **QBER Estimation:** Alice and Bob select a random 10% sample of their sifted keys, share the bits, and calculate the error rate. These bits are discarded.
7. **Threshold Check:** If QBER is above `qber_threshold` (typically $11\%$), the session is aborted.
8. **Error Reconciliation:** The remaining sifted bits are corrected for channel errors.
9. **Privacy Amplification:** HKDF-SHA256 is run on the reconciled key to compress it and reduce Eve's maximum potential information to an exponentially small bound.

---

## Eavesdropping: Eve's Intercept-Resend Attack

When Eve eavesdrops:
- She guesses the correct basis with a $50\%$ probability. If she guesses correctly, she measures the state without disturbing it and forwards it.
- She guesses the incorrect basis with a $50\%$ probability. In this case, her measurement projects the state into a conjugate basis, destroying the original information. When Bob measures the forwarded state, even if he chooses the same basis as Alice, he gets a random result.
- Thus, for matching Alice-Bob bases, Eve's presence introduces an error rate of:
  $$\text{QBER} = 0.50 \times 0.0 + 0.50 \times 0.50 = 0.25 \quad (25\%)$$
This statistical threshold ($25\%$) is the mathematical signature of the intercept-resend attack in BB84.

---

## Post-Processing

### Prototype Reconciliation (Cascade)
We implement a multi-pass Cascade-style block-parity error correction protocol:
1. **Pass 1:** Divide the keys into blocks of size 8. If Alice's block parity does not match Bob's, perform a binary search (halving the block and comparing parities of subblocks) to locate and correct the error.
2. **Pass 2, 3, 4:** Re-shuffle the keys using a shared seed (so both Alice and Bob shuffle identically) and repeat the parity checks with increasing block sizes (16, 32, 64). Shuffling scatters multiple errors in a block so they can be isolated and corrected.

### Privacy Amplification (HKDF-SHA256)
Using OpenSSL's HKDF implementation, Alice and Bob pack the reconciled key bits into bytes. They pass this to HKDF-SHA256, using the QKD session ID as the salt and a custom application label as context info. The HKDF compresses the key to the requested length (e.g. 256 bits), ensuring that even if Eve obtained partial knowledge of some bits, her knowledge of the final key is mathematically negligible.

---

## Build and Test Instructions

### Prerequisites
- Compiler supporting C++20 (GCC 10+, Clang 11+, or MSVC 2019+)
- OpenSSL (v3.0 or later)
- CMake (v3.14 or later)

### Build Steps
```bash
# Configure the build directory
cmake -S . -B build -DOPENSSL_ROOT_DIR=/opt/homebrew/opt/openssl@3

# Compile targets
cmake --build build
```

### Running Tests
```bash
# Run tests via CTest
ctest --test-dir build --output-on-failure

# Alternatively, run test executable directly
./build/qkd_tests
```

---

## Demo Instructions

Run the demo CLI application to observe the three scenarios requested:

### 1. Eve OFF (Zero QBER)
Runs the simulation without eavesdropping. QBER will be approximately 0% and key exchange will be accepted.
```bash
./build/bb84_demo --bits 100000
```

### 2. Eve ON (25% QBER)
Runs the simulation with Eve intercepting. QBER will be approximately 25% and key exchange will be rejected.
```bash
./build/bb84_demo --bits 100000 --eve
```

---

## Future Integration with QKD Key Manager

In a production application like **QryptMail**, the QKD engine acts as the lowest-level layer.
1. **QKD Engine:** Performs raw BB84 simulations (or interfaces with real quantum cards) to continuously produce shared keys.
2. **Key Manager (KM):** Collects keys from the engine, stores them securely in a Key Store, handles key synchronization, key expiration, metadata (Session ID, key ID, timestamp), and serves keys to applications.
3. **QryptMail SMTP/IMAP Client:** Requests a key from the Key Manager (using the session ID) and uses it to encrypt emails (e.g. using AES-256-GCM) before sending them.
