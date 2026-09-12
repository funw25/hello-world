#include<stdio.h>
#include<math.h>
int main() 
{
	int x;
	double y;
	scanf("%d",&x);
	y=pow(x,3.500)+fabs(x-2.000)+1.000/x;
	printf("y=%.3f",y);
	return 0;
}
