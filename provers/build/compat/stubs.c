/* Process-control stubs for running E in WebAssembly (wasm32-wasi).
   WASI has no processes, pipes or signals: process calls fail with ENOSYS
   and the CPU limit is polled (wasm_check_cpu_limit) instead of being
   delivered as SIGXCPU. */
#include <errno.h>
#include <stdio.h>
#include <time.h>
#include <sys/types.h>
#include <sys/resource.h>
#include <signal.h>

pid_t fork(void) { errno = ENOSYS; return -1; }
pid_t wait(int *status) { (void)status; errno = ECHILD; return -1; }
pid_t waitpid(pid_t pid, int *status, int options) { (void)pid; (void)status; (void)options; errno = ECHILD; return -1; }
int pipe(int fd[2]) { (void)fd; errno = ENOSYS; return -1; }
int dup2(int oldfd, int newfd) { (void)oldfd; (void)newfd; errno = ENOSYS; return -1; }
int kill(pid_t pid, int sig) { (void)pid; (void)sig; errno = ENOSYS; return -1; }
FILE *popen(const char *cmd, const char *mode) { (void)cmd; (void)mode; errno = ENOSYS; return NULL; }
int pclose(FILE *f) { (void)f; errno = ENOSYS; return -1; }

static rlim_t cpu_limit = RLIM_INFINITY;   /* seconds, as RLIMIT_CPU */

int getrlimit(int resource, struct rlimit *rlim)
{
   rlim->rlim_cur = resource == RLIMIT_CPU ? cpu_limit : RLIM_INFINITY;
   rlim->rlim_max = RLIM_INFINITY;
   return 0;
}

int setrlimit(int resource, const struct rlimit *rlim)
{
   if(resource == RLIMIT_CPU)
   {
      cpu_limit = rlim->rlim_cur;
   }
   return 0;
}

void wasm_check_cpu_limit(void)
{
   if(cpu_limit != RLIM_INFINITY &&
      (double)clock() / CLOCKS_PER_SEC >= (double)cpu_limit)
   {
      raise(SIGXCPU);
   }
}
