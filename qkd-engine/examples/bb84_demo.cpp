#include "qkd/qkd_engine.hpp"
#include "common/bytes.hpp"
#include <iostream>
#include <string>
#include <vector>
#include <iomanip>

using namespace qrypt::qkd;

void print_help() {
    std::cout << "Usage: bb84_demo [options]\n"
              << "Options:\n"
              << "  --bits <num>   Number of raw bits to transmit (default: 10000)\n"
              << "  --eve          Enable Eve intercept-resend attack (default: false)\n"
              << "  --eve=true     Enable Eve intercept-resend attack\n"
              << "  --eve=false    Disable Eve intercept-resend attack\n"
              << "  --help         Display this help message\n";
}

int main(int argc, char* argv[]) {
    size_t raw_bits = 10000;
    bool eve_enabled = false;

    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "--help" || arg == "-h") {
            print_help();
            return 0;
        } else if (arg == "--bits") {
            if (i + 1 < argc) {
                raw_bits = std::stoull(argv[++i]);
            } else {
                std::cerr << "Error: --bits requires an argument\n";
                return 1;
            }
        } else if (arg == "--eve") {
            eve_enabled = true;
        } else if (arg == "--eve=true") {
            eve_enabled = true;
        } else if (arg == "--eve=false") {
            eve_enabled = false;
        } else {
            std::cerr << "Unknown option: " << arg << "\n";
            print_help();
            return 1;
        }
    }

    BB84Config config{
        .raw_key_bits = raw_bits,
        .qber_threshold = 0.11,
        .eve_enabled = eve_enabled,
        .final_key_bits = 256
    };

    QKDEngine engine;
    QKDResult result = engine.run(config);

    std::cout << "=========================================\n"
              << "          BB84 QKD DEMONSTRATION\n"
              << "=========================================\n\n"
              << "Raw bits:       " << raw_bits << "\n"
              << "Eve:            " << (config.eve_enabled ? "ON" : "OFF") << "\n\n"
              << "Sifted bits:    " << result.sifted_bits << "\n"
              << "QBER:           " << std::fixed << std::setprecision(4) << (result.qber * 100.0) << " %\n\n"
              << "Status:         " << (result.accepted ? "ACCEPTED" : "REJECTED") << "\n\n"
              << "Final key size: " << (result.accepted ? std::to_string(config.final_key_bits) : "0") << " bits\n\n"
              << "=========================================\n";

    return 0;
}
