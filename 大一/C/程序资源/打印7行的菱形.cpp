#include <stdio.h>

int main() {
    // 打印上半部分
    for (int i = 1; i <= 4; i++) {
        for (int k = 0; k < 4 - i; k++) {
            printf(" ");
        }
        for (int j = 0; j < 2 * i - 1; j++) {
            printf("*");
        }
        printf("\n");
    }

    // 打印下半部分
    for (int i = 3; i >= 1; i--) {
        for (int k = 0; k < 4 - i; k++) {
            printf(" ");
        }
        for (int j = 0; j < 2 * i - 1; j++) {
            printf("*");
        }
        printf("\n");
    }

    return 0;
}



