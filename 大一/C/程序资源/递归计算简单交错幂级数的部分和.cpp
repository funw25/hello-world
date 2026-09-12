//本题要求实现一个函数，计算下列简单交错幂级数的部分和（其中x是double型数据，n是整型数据）:
//f(x,n)=x-x的2次方+x3的次方-x的4次方+...(-1)的n-1次方*x的n次方 
//double fn( double x, int n );
//其中题目保证传入的n是正整数，并且输入输出都在双精度范围内。函数fn应返回上述级数的部分和。建议尝试用递归实现。

#include <stdio.h>
#include<math.h>
double fn( double x, int n );

int main()
{
    double x;
    int n;

    scanf("%lf %d", &x, &n);
    printf("%.2f\n", fn(x,n));

    return 0;
}

double fn( double x, int n )
{
	if (n == 1) {
        return x;
    } else {
        return pow(-1, n - 1) * pow(x, n) + fn(x, n - 1);
    }
}
//当 n 等于 1 时，直接返回 x，这是级数的第一项。
//对于 n 大于 1 的情况，根据交错幂级数的规律，当前项为 (-1) ^ (n - 1) * x ^ n，
//然后通过递归调用 fn 函数来计算前 n - 1 项的和，并将当前项与前 n - 1 项的和相加，得到整个级数前 n 项的部分和。



