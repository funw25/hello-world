//.有一个整型二维数组，大小为m*n，找出最大值所在的行号和列号以及该最大值。
//下列程序使用一个函数max实现最大值的寻找，
//在max函数中使用了指针，m和n为该函数的形参，数组元素的值在主函数中输入。
#include <stdio.h>
void max(int (*arr)[10], int m, int n) {
    int max = arr[0][0];
    int row = 0;
    int col = 0;
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (*(*(arr + i) + j) > max) {//*(*(arr + i) + j) 等价于 arr[i][j]
                max = *(*(arr + i) + j);
                row = i;
                col = j;
            }
        }
    }
    printf("最大值为：%d\n", max);
    printf("最大值所在行号：%d\n", row);
    printf("最大值所在列号：%d\n", col);
}

int main() {
    int arr[10][10];
    int m, n;
    scanf("%d %d", &m, &n);
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            scanf("%d", &arr[i][j]);
        }
    }
    max(arr, m, n);
    return 0;
}
