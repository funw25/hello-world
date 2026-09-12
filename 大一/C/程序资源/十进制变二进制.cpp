#include <stdio.h>

int main() {
    int a;
    scanf("%u", &a);

    // 用于存储二进制数的数组，假设32位无符号整数最多需要32个二进制位来表示
    int b[32];
    int index = 0;

    // 通过循环进行转换，不断除以2取余数，将余数存入数组
    while (a>0) {
        b[index++] =a%2;
        a/=2;
    }
    // 倒序输出数组中的二进制位，得到正确的二进制表示
    for (int i = index - 1; i >= 0; i--) {
        printf("%d", b[i]);
    }
    printf("\n");
    return 0;
}
