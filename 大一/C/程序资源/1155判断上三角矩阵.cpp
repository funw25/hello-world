//上三角矩阵指主对角线以下的元素都为0的矩阵；主对角线为从矩阵的左上角至右下角的连线。
//本题要求编写程序，判断一个给定的方阵是否上三角矩阵。
//每个矩阵信息的第一行给出一个不超过10的正整数n。随后n行，每行给出n个整数，其间以空格分隔。
//每个矩阵的判断结果占一行。如果输入的矩阵是上三角矩阵，输出“YES”，否则输出“NO”。
#include <stdio.h>

int main() {
    int T;
    scanf("%d", &T);//表示待测矩阵的个数。

    for (int t = 0; t < T; t++) {
        int n;
        scanf("%d", &n);

        int a[n][n];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                scanf("%d", &a[i][j]);
            }
        }

        int isUpper = 1;// 先假设是上三角矩阵，用1表示，后续如果不符合条件则改为0
        for (int i = 1; i < n; i++) {  // 遍历主对角线以下的元素，检查是否都为0

            for (int j = 0; j < i; j++) {
                if (a[i][j]!= 0) {
                    isUpper = 0;// 只要发现有非0元素，就说明不是上三角矩阵，修改标志为0
                    break;
                }
            }
            if (isUpper == 0) {
                break;// 如果已经确定不是上三角矩阵，直接跳出外层循环，无需继续检查
            }
        }
        if (isUpper == 1) {
            printf("YES\n");
        } else {
            printf("NO\n");
        }
    }
    return 0;
}

