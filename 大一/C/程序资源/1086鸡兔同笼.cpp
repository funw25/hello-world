//鸡兔同笼问题。鸡和兔的头共有196 个，脚共有772 只，编程求出鸡有多少只，兔有多少只
#include"stdio.h"
int main()
{
	int i,j;
	for(i=1;i<=196;i++)//鸡 
	{
		for(j=1;j<=196;j++)//兔 
		{
			if(i+j==196 && i*2+j*4==772) 
			printf("chicken=%d,rabbit=%d",i,j);
		}
	}
	return 0;
}
