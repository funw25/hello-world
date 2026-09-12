//本题要求实现一个统计整数中指定数字的个数的简单函数
//样例输入-21252 2
//样例输出 复制Number of digit 2 in -21252:3
//函数定义：int CountDigit( int number, int digit );
//其中number是不超过长整型的整数，digit为[1, 9]区间内的整数。
//函数CountDigit应返回number中digit出现的次数。

#include <stdio.h>
int CountDigit( int number, int digit );
int main()
{
    int number, digit;
    scanf("%d %d", &number, &digit);
    printf("Number of digit %d in %d:%d\n", digit, number, CountDigit(number, digit));
    return 0;
}
 
int CountDigit( int number, int digit )
{
	int count=0;
    int n=number<0? -number : number;  // 先取绝对值，方便后续处理
    while(n>0)
    {
        if (n%10==digit)
        {
            count++;
        }
        n/=10;
    }
    if (number<0&&digit==0)  // 单独处理负数且要统计数字0的情况，因为取绝对值时会忽略掉负号后的0
    {
        number=-number;
        while(number%10==0)
        {
            count++;
            number/=10;
        }
    }
    return count;
}


