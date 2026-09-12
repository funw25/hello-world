//定义一个函数计算一个整数的逆序数。

#include <stdio.h> 
int reverse( int number ); 
int main()
{
    int n; 
    scanf("%d", &n);
    printf("%d\n", reverse(n)); 
    return 0;
} 
int reverse( int number )
{
	int result=0;
	while(number!=0)
	{
		result=result*10+number%10;
        number/=10;
	}
	return result;
}
