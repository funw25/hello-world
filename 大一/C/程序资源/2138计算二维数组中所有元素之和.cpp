#include <stdio.h>

int main() {
    int m, n;
    scanf("%d %d", &m, &n);

    int arr[m][n];
    int i, j;

    // 输入二维数组元素
    for (i = 0; i < m; i++) {
        for (j = 0; j < n; j++) {
            scanf("%d", &arr[i][j]);
        }
    }

    int sum = 0;
    // 计算二维数组元素之和
    for (i = 0; i < m; i++) {
        for (j = 0; j < n; j++) {
            sum += arr[i][j];
        }
    }

    printf("%d", sum);

    return 0;
}
