//输入精度e，要求定义和调用函数，根据格雷戈里公式求PI的近似值(在主函数中输入和输出)。
//4*(1-1/3+1/5-1/7+...)
#include <stdio.h>

// 根据格雷戈里公式计算PI近似值的函数，参数e为精度要求
double calculatePI(double e) {
    double sum = 0.0;
    int n = 0;
    double term;
    do {
        term = (double)(1.0 / (2 * n + 1));
        if (n % 2 == 1) {
            term = -term;
        }
        sum += term;
        n++;
    } while (term > e || -term > e);  // 根据当前项的绝对值是否大于精度要求来决定是否继续循环
    return sum * 4;  // 格雷戈里公式计算得到的是PI/4，所以最后要乘以4得到PI近似值
}

int main() {
    double e;
    scanf("%lf", &e);
    double result = calculatePI(e);
    printf("近似值为%.6lf", result);
    return 0;
}

