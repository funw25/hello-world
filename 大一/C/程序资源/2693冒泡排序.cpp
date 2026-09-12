//从键盘输入n个整数，
//用冒泡排序法将这些整数按从小到大进行排序
//（用指针编程）
#include <stdio.h>
void bubble(int *a,int n) {
	int i, j, temp;
    for (i = 0; i < n - 1; i++) {
        for (j = 0; j < n - i - 1; j++) {
            // 比较相邻元素
            if (*(a + j) > *(a + j + 1)) {
                // 交换元素
                temp = *(a + j);
                *(a + j) = *(a + j + 1);
                *(a + j + 1) = temp;
            }
        }
    }
}
int main(void) {
	int n, a[8];
	int i;
	scanf("%d",&n);
	for(i=0;i<n;i++)
		scanf("%d",&a[i]);
	bubble(a,n);
	for(i=0;i<n;i++)
		printf("%-3d",a[i]);
	return 0;
}
