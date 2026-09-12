//从键盘输入5个数字，用冒泡排序法将这些数字按从小到大进行排序。
#include <stdio.h>
int main() {
    int a[5];
    int i, j, temp;
    // 从键盘输入 5 个数字
    for (i = 0; i < 5; i++) {
        scanf("%d", &a[i]);
    }
    // 冒泡排序
    for (i = 0; i < 4; i++) {
        for (j = 0; j < 4 - i; j++) {
            if (a[j] > a[j + 1]) {
                // 交换 a[j] 和 a[j + 1] 的位置
                temp = a[j];
                a[j] = a[j + 1];
                a[j + 1] = temp;
            }
        }
    }
    // 输出排序好的数组
    for (i = 0; i < 5; i++) {
        printf("%d ", a[i]);
    }
    printf("\n");

    return 0;
}
