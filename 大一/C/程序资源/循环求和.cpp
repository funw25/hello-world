#include<stdio.h>
int main()
{
	int i;
	double sum=0;
	for(i=1;1.0/i>=0.00001;i++){
		sum+=1.0/i;	
	}
	printf("%.2lf",sum);
	return 0;
}
