/* <sys/resource.h> for wasm32-wasi plus the rlimit API (stubbed in stubs.c:
   there are no resource limits in WebAssembly). */
#ifndef LOGICUS_WASM_SYS_RESOURCE_H
#define LOGICUS_WASM_SYS_RESOURCE_H
#include_next <sys/resource.h>

typedef unsigned long long rlim_t;
struct rlimit {
    rlim_t rlim_cur;
    rlim_t rlim_max;
};
int getrlimit(int, struct rlimit *);
int setrlimit(int, const struct rlimit *);

#define RLIM_INFINITY (~0ULL)
#define RLIMIT_CPU     0
#define RLIMIT_FSIZE   1
#define RLIMIT_DATA    2
#define RLIMIT_STACK   3
#define RLIMIT_CORE    4
#define RLIMIT_RSS     5
#define RLIMIT_NPROC   6
#define RLIMIT_NOFILE  7
#define RLIMIT_MEMLOCK 8
#define RLIMIT_AS      9
#endif
