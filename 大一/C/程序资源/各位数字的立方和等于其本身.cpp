//输入两个正整数m和n，输出m和n之间所有满足各位数字的立方和等于其本身的数。
//要求定义和调用函数判断给定的数是否满足上述要求。
#include"stdio.h"
int fun(int num)
{
    int x=num;
    int sum=0;
    while(num>0)
	{
        int digit=num%10;
        sum+=digit*digit*digit;
        num/=10;
    }
    if(sum==x){
    	return 1;
	}
	else{
		return 0;
	}
}

int main() {
    int m,n;
    scanf("%d %d",&m,&n);
    for(int i=m;i<=n;i++)
	{
        if(fun(i)==1)
		{
            printf("%d ",i);
        }
    }
    return 0;
}
