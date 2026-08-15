cmake_minimum_required(VERSION 3.14)
project(qkd_engine VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

set(MY_COMPILE_OPTIONS "")
if(MSVC)
    list(APPEND MY_COMPILE_OPTIONS /W4 /WX)
else()
    list(APPEND MY_COMPILE_OPTIONS -Wall -Wextra -Werror -pedantic)
endif()

if(NOT OPENSSL_ROOT_DIR)
    set(OPENSSL_ROOT_DIR "/opt/homebrew/opt/openssl@3")
endif()
find_package(OpenSSL REQUIRED)

include_directories(include)

file(GLOB_RECURSE SRC_FILES
    "src/bb84/*.cpp"
    "src/common/*.cpp"
    "src/qkd/*.cpp"
)

add_library(qkd_engine SHARED ${SRC_FILES})
target_include_directories(qkd_engine PUBLIC include)
target_link_libraries(qkd_engine PRIVATE OpenSSL::SSL OpenSSL::Crypto)
target_compile_options(qkd_engine PRIVATE ${MY_COMPILE_OPTIONS})

add_executable(bb84_demo examples/bb84_demo.cpp)
target_link_libraries(bb84_demo PRIVATE qkd_engine)
target_compile_options(bb84_demo PRIVATE ${MY_COMPILE_OPTIONS})

enable_testing()
include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/refs/tags/v1.14.0.tar.gz
)
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

file(GLOB TEST_FILES "tests/*.cpp")

add_executable(qkd_tests ${TEST_FILES})
target_link_libraries(qkd_tests PRIVATE qkd_engine gtest_main)
target_compile_options(qkd_tests PRIVATE ${MY_COMPILE_OPTIONS})

add_test(NAME qkd_tests COMMAND qkd_tests)
