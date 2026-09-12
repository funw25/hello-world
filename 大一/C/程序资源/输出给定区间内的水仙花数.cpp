//输出三位数中某个区间内的所有水仙花数。
//三位数的水仙花数是指各位上数字立方之和等于本身。 
#include<stdio.h>
#include<math.h>
int main()
{
	int m,n,i;
	scanf("%d %d",&m,&n);
	for(i=m;i<=n;i++){
		if(i==(pow(i%10,3)+pow(i/10%10,3)+pow(i/100,3)))
			printf("%d\n",i);
	}
	return 0;
}
