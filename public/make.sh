set -ex
# to build the output on ubuntu:
#   sudo apt-get install gcc-multilib
#                        (maybe also libc6:i386)
# then paste the output in app.asm
# and run this script
nasm -f elf app.asm
gcc -m32 -o app app.o
