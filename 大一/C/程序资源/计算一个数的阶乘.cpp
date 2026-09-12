#include<stdio.h>
int main(){
	int n,j=1,i=1;
	scanf("%d",&n);
	while(i<=n){
		j=j*i;
		i++;
	}
	printf("%d",j);
	return 0;
} 
