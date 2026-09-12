//函数定义：void pyramid( int n );
//其中n是用户传入的参数，为[1, 9]的正整数。要求函数按照如样例所示的格式打印出n行数字金字塔。注意每个数字后面跟一个空格。

#include <stdio.h>
void pyramid( int n );
int main()
{   
    int n;
    scanf("%d", &n);
    pyramid(n);
    return 0;
}

void pyramid( int n )
{
	if(n>=1 &&n<=9){
	int i;
	for(i=1;i<=n;i++)
	{
		for(int j=0;j<n-i;j++)//对于第i行，需要打印n - i个空格!!!
		{
			printf(" ");
		}
		for(int k=1;k<=i;k++)  
		{
			printf("%d ",i); 
		} 
		printf("\n"); 
	}
	}
	else ;
}
