//外层for循环中的每一轮，初始化min为这一轮的i，
//内层for循环从i+1开始比较与a[min]的大小，
//如果更小就更新min为j，
//当内层循环结束后，如果发现最小元素的索引min和起始索引i不一致，
//说明找到了更小的元素，就通过中间变量t进行交换操作，
//将a[min]和a[i]的值互换


#include"stdio.h" 
int main()
{
	int a[5];
	for(int i=0;i<5;i++){
		scanf("%d",&a[i]);
	}
	for(int i=0;i<4;i++){
		int min=i;
		for(int j=i+1;j<5;j++){
			if(a[j]<a[min]){
				min=j;
			}
		}
		if(min!=i){
			int t=a[min];
			a[min]=a[i];
			a[i]=t;
		}
	}
	for(int i=0;i<5;i++){
		printf("%d",a[i]);
	}
	return 0;
}
