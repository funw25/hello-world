//编程计算s的前100项的值，s=1+1/3-1/5+1/7-1/9+...
#include"stdio.h"
int main()
{
	int i,sign=1;
	double j,sum=1.0;
	for(i=1;i<100;i++)
	{
		j=sign/(i*2.0+1.0);
		sum+=j;
		sign=-sign;
	}
	printf("s=%.3lf",sum);
	return 0;
}

