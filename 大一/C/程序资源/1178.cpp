//键盘输入10个数，求平均值并输出所有小于平均值的数。
#include <stdio.h>

int main() {
    double nums[10];
    double sum = 0;
    for (int i = 0; i < 10; i++) {
        scanf("%lf", &nums[i]);
        sum += nums[i];
    }
    double average = sum / 10;
    printf("平均值为:%.1f\n", average);
    printf("小于平均值的数:");
    for (int i = 0; i < 10; i++) {
        if (nums[i] < average) {
            printf("%.1f ", nums[i]);
        }
    }
    printf("\n");
    return 0;
}
