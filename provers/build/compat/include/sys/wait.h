/* Minimal <sys/wait.h> for wasm32-wasi: there are no child processes. */
#ifndef LOGICUS_WASM_SYS_WAIT_H
#define LOGICUS_WASM_SYS_WAIT_H
#include <sys/types.h>
#define WNOHANG 1
#define WUNTRACED 2
#define WEXITSTATUS(s) (((s) & 0xff00) >> 8)
#define WTERMSIG(s) ((s) & 0x7f)
#define WIFEXITED(s) (!WTERMSIG(s))
#define WIFSIGNALED(s) (((signed char)(((s) & 0x7f) + 1) >> 1) > 0)
pid_t wait(int *status);
pid_t waitpid(pid_t pid, int *status, int options);
#endif
