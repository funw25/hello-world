//本题要求实现计算两个复数之积的函数（假设复数的实部和虚部都是整数）
#include"stdio.h"
struct complex
{
	int real;
	int imag;
};
struct complex multiply(struct complex x, struct complex y)
{
	struct complex result;
    // 根据复数乘法公式计算结果的实部和虚部
    result.real = x.real * y.real - x.imag * y.imag;
    result.imag = x.real * y.imag + x.imag * y.real;
    return result;

}
int main()
{
    struct complex product, x, y;
    scanf("%d%d%d%d", &x.real, &x.imag, &y.real, &y.imag);
    product = multiply(x, y);
    printf("(%d+%di) * (%d+%di) = %d + %di\n", x.real, x.imag, y.real, y.imag, product.real, product.imag);
    return 0;
} 

