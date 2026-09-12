//旅行者小李在他的冒险旅程中，偶然间得到了三张神秘的卡片，
//每张卡片上都刻有一个神秘的数字。小李决定进行一个简单的小游戏：他会随机说出一个数，
//如果这个数和这三张卡片中最大的数一样，那么他就将欢呼“YES”，否则，他将轻声叹息“NO”。
#include<stdio.h>
#include<math.h>
int main()
{
    int a,b,c,t,x;
	scanf("%d %d %d %d",&a,&b,&c,&x);
	a>=1&&a<=pow(10,5);
    b>=1&&b<=pow(10,5);
    c>=1&&c<=pow(10,5);
    x>=1&&x<=pow(10,5);
    if(a<b)
	{t=a;a=b;b=t;}
	if(a<c)
	{t=a;a=c;c=t;}
	if(b<c)
	{t=b;b=c;c=t;}
  	if(x==a)
	{
  		printf("YES");
	}	
    if(x!=a)
	{
    	printf("NO");
    }
    return 0;
}

