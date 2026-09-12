#include <stdio.h>
void max(int *a, int m, int n, int *max1, int *row, int *col) {
    *max1 = *a;  // 先假设第一个元素是最大值
    *row = 0;
    *col = 0;
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (*(a + i * n + j) > *max1) {
                *max1 = *(a + i * n + j);  // 更新最大值
                *row = i;  // 更新最大值所在行号
                *col = j;  // 更新最大值所在列号
            }
        }
    }
}
int main() {
    int m, n;
	int a[m][n];  // 二维数组的行数和列数
    int max1, row, col;  // 最大值及其所在行号和列号
    scanf("%d %d", &m, &n);
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            scanf("%d", a[i][j]);
        }
    }
    max(a, m, n, &max1, &row, &col);
    printf("最大值是 %d，第 %d 行第 %d 列\n", max1, row + 1, col + 1);
    return 0;
}
